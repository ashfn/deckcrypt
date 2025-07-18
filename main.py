factorials = []
alphabet = " .,-\"/abcdefghijklmnopqrstuvwxyz"
cards = [
    'A♠', '2♠', '3♠', '4♠', '5♠', '6♠', '7♠', '8♠', '9♠', '10♠', 'J♠', 'Q♠', 'K♠',
    'A♥', '2♥', '3♥', '4♥', '5♥', '6♥', '7♥', '8♥', '9♥', '10♥', 'J♥', 'Q♥', 'K♥',
    'A♦', '2♦', '3♦', '4♦', '5♦', '6♦', '7♦', '8♦', '9♦', '10♦', 'J♦', 'Q♦', 'K♦',
    'A♣', '2♣', '3♣', '4♣', '5♣', '6♣', '7♣', '8♣', '9♣', '10♣', 'J♣', 'Q♣', 'K♣'
]
for i in range(1000):
    if(i==0):
        factorials.append(1)
    else:
        factorials.append(i*factorials[i-1])

def convertToFactoradic(number: int) -> [int]:
    result = []
    divisor = 1
    while(number > 0):
        result.insert(0, number % divisor)
        number //= divisor
        divisor+=1
    return result

def convertToDenary(number: [int]) -> int:
    global factorials
    result = 0
    numlen = len(number)
    for i in range(numlen):
        result += number[i]*factorials[numlen-i-1]
    return result

# Will return a list of permutationElements size 0 indexed elements in the order from the number
# The number msut be less than permutationElements!
def convertToPermutation(number: int, permutationElements: int) -> [int]:
    global factorials
    if(number >= factorials[permutationElements]):
        raise ValueError("Given number is outside of permutation range")
    factoradic = convertToFactoradic(number)
    while len(factoradic) < permutationElements:
        factoradic.insert(0,0)
    available = list(range(permutationElements))
    permutation = []
    for i in factoradic:
        permutation.append(available[i])
        available.pop(i)
    return permutation

def convertToDecimal(permutation: [int]) -> int:

    permlength = len(permutation)
    factoradic = []

    numbers = list(range(permlength))

    for i in permutation:
        index = numbers.index(i)
        factoradic.append(index)
        numbers.pop(index)
    print(factoradic)
    return convertToDenary(factoradic)

def textToPackOfCards(text: str) -> [int]:
    global alphabet
    if(len(text) > 45):
        raise ValueError("Text must be <=45 characters to be represented in one deck of cards")
    for i in text.lower():
        if not i in alphabet:
            raise ValueError("Text must only be characters A-Z or '., -\"/' in order to use 5bit")
    data = 0
    for i in text.lower():
        data<<=5
        data|=alphabet.index(i)
    data <<= (5*(45-len(text)))
    return convertToPermutation(data, 52)
def packOfCardsToText(cards: [int]) -> str:
    global alphabet
    if(len(cards)!=52):
        return ValueError("Pack must have 52 distinct 0 indexed cards")
    testcards = list(range(52))
    for i in cards:
        testcards.pop(testcards.index(i))
    if(len(testcards)>0):
        return ValueError("Pack must have 52 distinct 0 indexed cards")
    number = convertToDecimal(cards)
    result = ""
    binstring = bin(number)[2:]
    while(len(binstring)<45*5):
        binstring = "0" + binstring;
    for i in range(45):
        x = int(binstring[i*5:(i+1)*5], 2)
        result += alphabet[x]
    return result


#    This is 45 characters of text which can be stored in a pack of 52 playing cards
#    abcdefghijklmnopqrstuvwxyzabcdefghijklnnopqrs
#tnum = 22460398060890687638644604344344764536689096168995043803493220483072
#print(convertToPermutation(tnum, 52))
#print(convertToDecimal(convertToPermutation(tnum, 52)))
tstr = "hello world" 

c = textToPackOfCards(tstr)
print(c)
for i in c:
    print(cards[i], end=" ")
# secretcards = textToPackOfCards(tstr)

# #for i in secretcards:
# #    print(cards[i])
# print(textToPackOfCards(tstr))
print(textToPackOfCards(tstr))
print(packOfCardsToText(textToPackOfCards(tstr)))
# print(packOfCardsToText([0, 24, 4, 46, 19, 51, 20, 23, 21, 7, 14, 48, 43, 34, 17, 15, 13, 3, 42, 36, 50, 25, 32, 12, 33, 27, 1, 47, 37, 39, 31, 2, 18, 6, 22, 38, 30, 41, 
# 28, 10, 26, 29, 40, 35, 49, 16, 45, 8, 5, 9, 11, 44]))

# print(convertToDecimal([3,1,2,4,0]))
# print(convertToFactoradic(17))