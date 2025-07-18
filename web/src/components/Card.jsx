import React from 'react';

const cardList = [
  'A♠', '2♠', '3♠', '4♠', '5♠', '6♠', '7♠', '8♠', '9♠', '10♠', 'J♠', 'Q♠', 'K♠',
  'A♥', '2♥', '3♥', '4♥', '5♥', '6♥', '7♥', '8♥', '9♥', '10♥', 'J♥', 'Q♥', 'K♥',
  'A♦', '2♦', '3♦', '4♦', '5♦', '6♦', '7♦', '8♦', '9♦', '10♦', 'J♦', 'Q♦', 'K♦',
  'A♣', '2♣', '3♣', '4♣', '5♣', '6♣', '7♣', '8♣', '9♣', '10♣', 'J♣', 'Q♣', 'K♣',
];

function getCardInfo(index) {
  const str = cardList[index];
  // Rank could be 1 or 2 characters (A vs 10)
  const suit = str.slice(-1);
  const rank = str.slice(0, -1);
  return { rank, suit };
}

function Card({ index, onClick, selected = false, disabled = false, dropTarget = false, ...rest }) {
  const { rank, suit } = getCardInfo(index);
  const isRed = suit === '♥' || suit === '♦';

  const baseClasses =
    'relative w-12 h-16 m-1 bg-white border rounded-lg shadow text-xs font-bold flex flex-col justify-between p-1 select-none';
  const colorClass = isRed ? 'text-red-600' : 'text-black';
  const selectedClass = selected ? 'ring-2 ring-blue-500' : '';
  const disabledClass = disabled ? 'opacity-50 cursor-default' : 'cursor-pointer hover:shadow-lg';

  return (
    <div
      className={`${baseClasses} ${selectedClass} ${disabledClass}`}
      onClick={disabled ? undefined : onClick}
      {...rest}
    >
      {dropTarget && (
        <div className="absolute -left-1 top-0 h-full w-1 bg-blue-500"></div>
      )}
      <span className={colorClass}>
        {rank}
        {suit}
      </span>
      <span className={`self-end rotate-180 ${colorClass}`}>
        {rank}
        {suit}
      </span>
    </div>
  );
}

export { cardList };
export default Card; 