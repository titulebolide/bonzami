import csv
import argparse
from datetime import datetime
from django.core.management.base import BaseCommand, CommandError
from api.models import User, Expense, ExpenseShare, Group
from django.utils import timezone

class Command(BaseCommand):
    help = 'Imports expenses from a CSV file. Creates a new Group and Users for each import.'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Path to the CSV file')

    def handle(self, *args, **options):
        csv_file_path = options['csv_file']
        
        try:
            with open(csv_file_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                fieldnames = reader.fieldnames
                if not fieldnames:
                    raise CommandError("CSV file is empty or missing headers")
                
                # Normalize headers: strip spaces
                fieldnames = [fn.strip() for fn in fieldnames]
                reader.fieldnames = fieldnames
                
                # Identify columns
                date_field = None
                if 'creation_date' in fieldnames:
                    date_field = 'creation_date'
                elif 'cration_date' in fieldnames:
                    date_field = 'cration_date'
                else:
                    raise CommandError("Could not find creation_date or cration_date column")
                
                required_fields = ['payer', 'name', 'amount', date_field]
                for req in required_fields:
                    if req not in fieldnames:
                        raise CommandError(f"Missing required column: {req}")
                
                # Identify Share Columns (must start with "share_")
                share_columns = {} # map column_name -> user_name
                for fn in fieldnames:
                    if fn.lower().startswith('share_'):
                        user_name = fn[6:] # strip 'share_'
                        share_columns[fn] = user_name
                
                self.stdout.write(f"Identified share columns: {list(share_columns.keys())}")
                self.stdout.write(f"Mapped to users: {list(share_columns.values())}")
                
                if not share_columns:
                     self.stdout.write(self.style.WARNING("No share columns found (starting with 'share_')."))
                
                # Create a new Group for this import
                timestamp = timezone.now().strftime('%Y-%m-%d %H:%M:%S')
                group_name = f"Imported {timestamp}"
                new_group = Group.objects.create(name=group_name)
                self.stdout.write(f"Created new Group: '{group_name}' (ID: {new_group.id})")
                
                # Cache for users created in this session
                created_users = {}

                def get_or_create_import_user(name):
                    clean_name = name.strip()
                    if not clean_name:
                         return None
                    if clean_name in created_users:
                        return created_users[clean_name]
                    
                    # Create new user in the new group
                    user = User.objects.create(name=clean_name, group=new_group)
                    created_users[clean_name] = user
                    return user

                success_count = 0
                
                for row_idx, row in enumerate(reader, start=1):
                    payer_name = row['payer'].strip()
                    expense_name = row['name'].strip()
                    amount_str = row['amount'].strip()
                    date_str = row[date_field].strip()
                    
                    try:
                        amount = float(amount_str)
                    except ValueError:
                        self.stderr.write(f"Row {row_idx}: Invalid amount '{amount_str}', skipping.")
                        continue
                        
                    # Parse Date
                    try:
                        dt = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S.%f")
                        dt = timezone.make_aware(dt)
                    except ValueError:
                        try:
                            dt = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")
                            dt = timezone.make_aware(dt)
                        except ValueError as e:
                            self.stderr.write(f"Row {row_idx}: Invalid date format '{date_str}', skipping. Error: {e}")
                            continue

                    # Get or Create Payer
                    payer = get_or_create_import_user(payer_name)
                    if not payer:
                         self.stderr.write(f"Row {row_idx}: Invalid payer name '{payer_name}', skipping.")
                         continue
                        
                    # Calculate Shares
                    shares = {}
                    total_share_val = 0.0
                    
                    for col_name, user_name in share_columns.items():
                        val_str = row.get(col_name, '0').strip()
                        if not val_str: 
                            val_str = '0'
                        try:
                            val = float(val_str)
                            if val > 0:
                                shares[user_name] = val
                                total_share_val += val
                        except ValueError:
                             self.stderr.write(f"Row {row_idx}: Invalid share value for {user_name} (col {col_name}): '{val_str}'")
                    
                    if total_share_val <= 0:
                         self.stderr.write(f"Row {row_idx}: No valid shares found, skipping.")
                         continue
                         
                    # Normalize shares
                    normalized_shares = {}
                    for u_name, val in shares.items():
                        normalized_shares[u_name] = val / total_share_val
                        
                    # Create Expense
                    expense = Expense.objects.create(
                        name=expense_name,
                        date=dt,
                        amount=amount,
                        group=new_group,
                        by=payer
                    )
                    
                    # Create ExpenseShares
                    for u_name, share_val in normalized_shares.items():
                        user = get_or_create_import_user(u_name)
                        if user:
                            ExpenseShare.objects.create(
                                user=user,
                                expense=expense,
                                share=share_val
                            )
                    
                    success_count += 1
                
                self.stdout.write(self.style.SUCCESS(f"Successfully imported {success_count} expenses into group '{group_name}'."))

        except FileNotFoundError:
            raise CommandError(f"File not found: {csv_file_path}")
        except Exception as e:
             raise CommandError(f"An error occurred: {e}")
