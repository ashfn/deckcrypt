#pragma once
#include "bignum.h"
#include <array>

std::array<int, 52> textToPackOfCards(std::string text);
std::string packOfCardsToText(std::array<int, 52> cards);
std::array<int, 52> textToPackOfCardsEncrypted(std::string text, std::string key);
std::string packOfCardsToTextEncrypted(std::array<int, 52> cards, std::string key);