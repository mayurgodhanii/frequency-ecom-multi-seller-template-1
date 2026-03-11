

import React from "react";

const getStaticStyles = (name) => {
  switch (name) {
    case "text":
      return { fontSize: "16px", color: "#333", lineHeight: "1.6", margin: "20px 0" };
    case "image":
      return { maxWidth: "200px", display: "block", margin: "20px 0" };
    case "button":
      return {
        padding: "8px 20px",
        border: "1px solid black",
        textDecoration: "none",
      };
    case "video":
      return { width: "100%", maxWidth: "200px", display: "block", margin: "20px 0" };
    case "box":
    case "section":
    case "columns":
      return {
        padding: "20px",
        margin: "10px 0",
        border: "1px solid #ddd",
        fontSize: "16px",
        color: "#333",
        lineHeight: "1.6",
      };
    default:
      return {};
  }
};

const DynamicComponent = ({ component }) => {
  const { name, options } = component;

  // Log component details for debugging
  

  if (!name || !options) {
    console.warn(`Invalid component structure:`, { component });
    return <div>Invalid component structure</div>;
  }

  const staticStyle = getStaticStyles(name);

  switch (name) {
    case "text":
      return (
        <div
          id={options?.id}
          style={staticStyle}
          dangerouslySetInnerHTML={{ __html: options?.text || "" }}
        />
      );
    case "image":
      return options?.image_url ? (
        <img
          id={options?.id}
          src={options.image_url}
          alt="Image"
          style={staticStyle}
        />
      ) : (
        <div id={options?.id} style={staticStyle}>
          No image URL provided
        </div>
      );
    case "button":
      return (
        <a
          id={options?.id}
          href={options?.link || "#"}
          className="btn"
          style={staticStyle}
        >
          {options?.text || "Button"}
        </a>
      );
    case "video":
      return options?.video_url ? (
        <video
          id={options?.id}
          src={options.video_url}
          style={staticStyle}
          autoPlay
          controls
        />
      ) : (
        <div id={options?.id} style={staticStyle}>
          No video URL provided
        </div>
      );
    case "box":
    case "section":
    case "columns":
      return (
        <div
          id={options?.id}
          className={name}
          style={staticStyle}
        >
          {options?.contents?.length > 0 ? (
            options.contents.map((subSection, idx) => (
              <DynamicComponent
                key={subSection.component.options?.id || `sub-${idx}`}
                component={subSection.component}
              />
            ))
          ) : (
            <div>Empty {name}</div>
          )}
        </div>
      );
    default:
      console.warn(`Unsupported component type: ${name}`);
      return <div id={options?.id}>Unsupported component: {name}</div>;
  }
};

export default DynamicComponent;

