import { useState } from "react";

export default function CodeBlock({ code, language = "solidity", filename }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const plain = code.replace(/<[^>]+>/g, "");
    await navigator.clipboard.writeText(plain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="codeblock-wrapper">
      {filename && (
        <div className="codeblock-header">
          <span className="codeblock-lang">{language}</span>
          <span className="codeblock-filename">{filename}</span>
          <button className="codeblock-copy" onClick={handleCopy}>
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}
      {!filename && (
        <button
          className="codeblock-copy codeblock-copy-float"
          onClick={handleCopy}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      )}
      <div className="code-block">
        <pre dangerouslySetInnerHTML={{ __html: code }} />
      </div>
    </div>
  );
}
