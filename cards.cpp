#include <bitset>
#include <cstdint>
#include <vector>
#include "bignum.h"
#include <set>
#include <iostream>
#include <algorithm>
#include <array>
#include "cards.h"

std::vector<Num> factorials;
std::string alphabet_str = " .,-\"/abcdefghijklmnopqrstuvwxyz";
std::vector<char> alphabet = std::vector<char>(alphabet_str.begin(), alphabet_str.end());

Num getFactorial(Num n){
  if(factorials.size() == 0){
    for(Num i=0; i<1000; i+=1){
      if(i==0) factorials.push_back(Num(1));
      else factorials.push_back(factorials.back() * i);
    }
  }
  return factorials[n.to_double()];
}

std::vector<Num> decimalToFactoradic(Num decimal){
  std::vector<Num> result;
  int divisor = 1;
  while(decimal > 0){
    result.insert(result.begin(), (decimal % divisor));
    decimal /= divisor;
    divisor++;
  }
  return result;
}

Num factoradicToDecimal(std::vector<Num> factoradic){
  Num result(0);
  for(int i=0; i<factoradic.size(); i++){
    // result += factoradic[i]*factorials[factoradic.size()-i-1];
    result += factoradic[i] * getFactorial(factoradic.size()-i-1);
  }
  return result;
}

std::vector<Num> decimalToPermutation(Num decimal, Num permutationSize){
  std::vector<Num> factoradic = decimalToFactoradic(decimal);
  while(factoradic.size()<permutationSize.to_double()){
    factoradic.insert(factoradic.begin(), 0);
  }

  std::vector<Num> available;
  for(Num i(0); i<permutationSize.to_double(); i+=1){
    available.push_back(i);
  }

  std::vector<Num> permutation;

  for(int i=0; i<factoradic.size(); i++){
    permutation.push_back(available[factoradic[i].to_double()]);
    available.erase(available.begin()+factoradic[i].to_double());
  }
  
  return permutation;
} 

Num permutationToDecimal(std::vector<Num> permutation){
  std::vector<Num> factoradic;

  std::vector<Num> numbers;
  for(Num i = 0; i<permutation.size(); i+=1){
    numbers.push_back(i);
  }
  std::cout << "numbers size: "<<numbers.size()<<"\n";
  for(Num num : permutation){
    Num index = std::find(numbers.begin(), numbers.end(), num) - numbers.begin();
    factoradic.push_back(index);
    numbers.erase(numbers.begin()+index.to_double());
  }
  std::cout << "factoradic size: "<<factoradic.size()<<"\n";
  return factoradicToDecimal(factoradic);

}

std::bitset<225> textToBitset(std::string text){
  std::bitset<225> data = 0;

  for(int i=0; i<text.size(); i++){
    data <<= 5;
    uint8_t character = std::find(alphabet.begin(), alphabet.end(), text[i]) - alphabet.begin();
    data |= character;
  }
  data <<= (5*(45-text.size()));
  return data;
}

std::string bitsetToText(std::bitset<225> data){
  std::vector<uint64_t> words(4,0);
  for(int i=0; i<225; i++){
    int index = i / 64;
    int bit = i % 64;
    if(data[i]){
      words[index] |= uint64_t(1)<<bit;
    }
  }

  Num num(words.data(), words.data()+words.size());
  std::string result = "";
    for(int i=0; i<45; i++){
    uint8_t index = (num % 32).to_double();
    num /= 32;
    result = alphabet[index]+result;
  }
  return result;
}

std::array<int, 52> binaryToPackOfCards(std::bitset<225> data){
  std::vector<uint64_t> words(4,0);
  for(int i=0; i<225; i++){
    int index = i / 64;
    int bit = i % 64;
    if(data[i]){
      words[index] |= uint64_t(1)<<bit;
    }
  }

  Num num(words.data(), words.data()+words.size());

  std::cout << "bin: "<<data.to_string()<<"\n";

  std::cout << "num: "<<num<<"\n";
  std::vector<Num> permutation = decimalToPermutation(num, 52);
  std::array<int, 52> cards;
  for(int i=0; i<52; i++){
    cards[i]=permutation[i].to_double();
  }
  std::cout << "permsize: "<<cards.size() <<"\n";
  return cards;
}
std::array<int, 52> textToPackOfCards(std::string text){
  std::bitset<225> data = textToBitset(text);
  return binaryToPackOfCards(data);
}
std::array<int, 52> textToPackOfCardsEncrypted(std::string text, std::string key){
  std::bitset<225> data = textToBitset(text);
  std::bitset<225> keyData = textToBitset(key);
  data ^= keyData;
  return binaryToPackOfCards(data);

}
std::string packOfCardsToText(std::array<int, 52> cards){
  std::string result = "";
  std::vector<Num> permutation;
  for(int i=0; i<52; i++){
    permutation.push_back(Num(cards[i]));
  }
  std::cout << "permsize: "<<permutation.size() <<"\n";
  Num decimal(permutationToDecimal(permutation));
  std::cout << "decimal: "<<decimal<<"\n";
  for(int i=0; i<45; i++){
    uint8_t index = (decimal % 32).to_double();
    decimal /= 32;
    result = alphabet[index]+result;
  }
  return result;
}
std::string packOfCardsToTextEncrypted(std::array<int, 52> cards, std::string key){
  std::string text = packOfCardsToText(cards);
  std::bitset<225> data = textToBitset(text);
  std::bitset<225> keyData = textToBitset(key);
  data ^= keyData;
  return bitsetToText(data);
}