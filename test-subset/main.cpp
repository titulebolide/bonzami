#include <iostream>
#include <cstdlib>
#include <vector>
#include <string>
#include <ctime>

std::vector<int> genbal(int l, int nt) {
    std::srand(std::time(0));
    std::vector<int> res(l, 0);
    for (int i = 0; i < nt; i++) {
        int ta = 1 + std::rand() / ((RAND_MAX + 1u) / 15);
        int p = std::rand() / ((RAND_MAX + 1u) / l);
        int d = std::rand() / ((RAND_MAX + 1u) / l);
        std::cout << ta << " " << ta << " " << d << std::endl;
        res[p] += ta;
        res[d] -= ta; 
    }
    return res;
}

bool iSS(std::vector<int> & set, int n, int sum) {
    if (n == 1) {
        return set[0] == sum;
    } else {
        return iSS(set, n-1, sum) | iSS(set, n-1, sum - set[n-1]);
    }
}

std::string vec2str(std::vector<int> vec) {
    std::string res = "[";
    for (int i : vec) {
        res += std::to_string(i) + ", ";
    }
    res.pop_back();
    res.pop_back();
    res += "]";
    return res;
}

int main(void) {
    int l = 30;
    std::vector<int> set = genbal(l, 7);
    std::cout << vec2str(set) << std::endl;
    std::cout << iSS(set, l, 0) << std::endl;
    return 0;
}