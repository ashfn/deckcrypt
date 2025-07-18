#include <emscripten/bind.h>
#include "cards.h"

using namespace emscripten;

emscripten::val textToPackOfCardsJS(std::string text) {
    std::array<int, 52> cards = textToPackOfCards(text);
    return emscripten::val::array(cards.begin(), cards.end());
}

std::string packOfCardsToTextJS(emscripten::val jsArray) {
    std::array<int, 52> cards;
    for (int i = 0; i < 52; i++) {
        cards[i] = jsArray[i].as<int>();
    }
    return packOfCardsToText(cards);
}

std::string packOfCardsToTextEncryptedJS(emscripten::val jsArray, std::string key) {
    std::array<int, 52> cards;
    for (int i = 0; i < 52; i++) {
        cards[i] = jsArray[i].as<int>();
    }
    return packOfCardsToTextEncrypted(cards, key);
}

emscripten::val textToPackOfCardsEncryptedJS(std::string text, std::string key) {
    std::array<int, 52> cards = textToPackOfCardsEncrypted(text, key);
    return emscripten::val::array(cards.begin(), cards.end());
}

EMSCRIPTEN_BINDINGS(cardcode){
  function("textToPackOfCards", &textToPackOfCardsJS);
  function("packOfCardsToText", &packOfCardsToTextJS);
  function("packOfCardsToTextEncrypted", &packOfCardsToTextEncryptedJS);
  function("textToPackOfCardsEncrypted", &textToPackOfCardsEncryptedJS);
}

