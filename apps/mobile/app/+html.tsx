import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: previewStyles }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const previewStyles = `
  body {
    background-color: #4b4b4b;
    background-image: url('/castle-wall-darker-blended.jpg');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    background-repeat: no-repeat;
  }

  @media (min-width: 768px) {
    html, body {
      height: 100vh;
      overflow: hidden;
    }

    body {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      box-sizing: border-box;
    }

    #root {
      max-width: 420px;
      width: 100%;
      max-height: 900px;
      height: 100%;
      border-radius: 36px;
      overflow: hidden;
      box-shadow:
        0 0 0 8px #1a1a1a,
        0 0 0 10px #3a3a3a,
        0 25px 50px rgba(0, 0, 0, 0.6);
    }
  }
`;
