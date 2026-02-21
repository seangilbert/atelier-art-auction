export const RollingDigit = ({ digit }) => (
  <span className="rolling-digit-wrap">
    <span key={digit} className="rolling-digit-char">{digit}</span>
  </span>
);

const RollingNumber = ({ value }) => {
  const digits = String(value).split("");
  return (
    <span className="rolling-number">
      {digits.map((d, i) => <RollingDigit key={digits.length - 1 - i} digit={d} />)}
    </span>
  );
};

export default RollingNumber;
