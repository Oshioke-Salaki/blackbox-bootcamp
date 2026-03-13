import { useState, useEffect, useRef } from "react";

const CIPHER_CHARS = "█▓░╔╗╚╝║═│┤├┬┴┼▲▼◆●■□▪▫◇◈⬡⬢";

export default function DecryptText({
  text,
  as: Tag = "span", // eslint-disable-line no-unused-vars
  delay = 0,
  duration = 1200,
  trigger = true,
  className = "",
  ...props
}) {
  const [display, setDisplay] = useState("");
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!trigger) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setStarted(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [trigger, delay]);

  useEffect(() => {
    if (!started) {
      setDisplay(text.replace(/[^\s]/g, () =>
        CIPHER_CHARS[Math.floor(Math.random() * CIPHER_CHARS.length)]
      ));
      return;
    }

    const chars = text.split("");
    const totalChars = chars.filter(c => c !== " ").length;
    const perChar = duration / totalChars;
    let resolved = 0;

    const interval = setInterval(() => {
      resolved++;
      setDisplay(
        chars
          .map((char, i) => {
            if (char === " ") return " ";
            const charIndex = chars.slice(0, i + 1).filter(c => c !== " ").length;
            if (charIndex <= resolved) return char;
            return CIPHER_CHARS[Math.floor(Math.random() * CIPHER_CHARS.length)];
          })
          .join("")
      );
      if (resolved >= totalChars) clearInterval(interval);
    }, perChar);

    return () => clearInterval(interval);
  }, [started, text, duration]);

  return (
    <Tag ref={ref} className={className} {...props}>
      {display}
    </Tag>
  );
}
