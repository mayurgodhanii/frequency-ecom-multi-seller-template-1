


import React, { useEffect } from "react";
import DynamicComponent from "~/components/DynamicComponent";

const Statistics = ({ content }) => {
  // Extract image container
  const imageComponent = content.contents.find(
    (item) => item.component.name === "image"
  );

  const backgroundImage = imageComponent?.component.components[0]?.options.image_url;
  const backgroundImageId = imageComponent?.component.components[0]?.options.id;

  // Extract all statistics items
  const statistics = content.contents.filter((item) =>
    item.component.name.startsWith("stats_")
  );

  // Track used IDs
  const usedIds = new Set(
    [
      imageComponent?.component.options.id,
      backgroundImageId,
      ...statistics.map((stat) => stat.component.options.id),
      ...statistics.flatMap((stat) =>
        stat.component.components.map((comp) => comp.options?.id)
      ),
    ].filter((id) => id)
  );

  // Filter dynamic components
  const dynamicComponents = content.contents.filter(
    (item) => !usedIds.has(item.component?.options?.id)
  );

  // Animation logic for counters
  useEffect(() => {
    const animateCounters = () => {
      const counters = document.querySelectorAll(".count");

      counters.forEach((counter) => {
        const updateCounter = () => {
          const target = parseInt(counter.getAttribute("data-to")) || 0;
          const speed = parseInt(counter.getAttribute("data-speed")) || 3000;
          const refreshInterval = parseInt(counter.getAttribute("data-refresh-interval")) || 50;
          const start = parseInt(counter.getAttribute("data-from")) || 0;

          const increment = target / (speed / refreshInterval);
          let current = start;

          const step = () => {
            current += increment;
            if (current < target) {
              counter.textContent = Math.ceil(current);
              setTimeout(step, refreshInterval);
            } else {
              counter.textContent = target;
            }
          };

          step();
        };

        // Start animation
        updateCounter();
      });
    };

    // Run animation when component mounts
    animateCounters();

    // Optional: Clean up if needed
    return () => {};
  }, []); // Empty dependency array to run once on mount

  return (
    <div
      className="bg-image pt-7 pb-5 pt-md-12 pb-md-9"
      style={{ backgroundImage: `url(${backgroundImage})` }} // Fixed syntax: use template literal
      id={backgroundImageId}
    >
      <div className="container" id={content.id}>
        <div className="row">
          {statistics.map((stat, index) => {
            const statId = stat.component.options.id;

            const countComponent = stat.component.components.find((c) => c.name === "count");
            const suffixComponent = stat.component.components.find((c) => c.name === "suffix");
            const labelComponent = stat.component.components.find((c) => c.name === "label");

            const count = countComponent?.options.text || "0";
            const suffix = suffixComponent?.options.text || "";
            const label = labelComponent?.options.text || "";

            return (
              <div className="col-6 col-md-3" key={index} id={statId}>
                <div className="count-container text-center">
                  <div className="count-wrapper text-white">
                    <span
                      className="count"
                      data-from="0"
                      data-to={count}
                      data-speed="3000"
                      data-refresh-interval="50"
                      id={countComponent?.options.id}
                    >
                      0
                    </span>
                    <span id={suffixComponent?.options.id}>{suffix}</span>
                  </div>
                  <h3 className="count-title text-white" id={labelComponent?.options.id}>
                    {label}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
        {/* Render dynamic components */}
        {dynamicComponents.length > 0 && (
          <div className="dynamic-components">
            {dynamicComponents.map((item, idx) => (
              <DynamicComponent
                key={item.component?.options?.id || `dynamic-${idx}`}
                component={item.component}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;






// import React from "react";

// const Statistics = ({ content }) => {

//   // Extract image container
//   const imageComponent = content.contents.find(
//     (item) => item.component.name === "image"
//   );

//   const backgroundImage = imageComponent?.component.components[0]?.options.image_url;
//   const backgroundImageId = imageComponent?.component.components[0]?.options.id;

//   // Extract all statistics items
//   const statistics = content.contents.filter((item) =>
//     item.component.name.startsWith("stats_")
//   );

//   return (
//     <div
//       className="bg-image pt-7 pb-5 pt-md-12 pb-md-9"
//       style={{ backgroundImage: `url(${backgroundImage})` }}
//       id={backgroundImageId}
//     >
//       <div className="container" id={content.id}>
//         <div className="row">
//           {statistics.map((stat, index) => {
//             const statId = stat.component.options.id;

//             const countComponent = stat.component.components.find((c) => c.name === "count");
//             const suffixComponent = stat.component.components.find((c) => c.name === "suffix");
//             const labelComponent = stat.component.components.find((c) => c.name === "label");

//             const count = countComponent?.options.text || "0";
//             const suffix = suffixComponent?.options.text || "";
//             const label = labelComponent?.options.text || "";

//             return (
//               <div className="col-6 col-md-3" key={index} id={statId}>
//                 <div className="count-container text-center">
//                   <div className="count-wrapper text-white">
//                     <span
//                       className="count"
//                       data-from="0"
//                       data-to={count}
//                       data-speed="3000"
//                       data-refresh-interval="50"
//                       id={countComponent?.options.id}
//                     >
//                       0
//                     </span>
//                     <span id={suffixComponent?.options.id}>{suffix}</span>
//                   </div>
//                   <h3
//                     className="count-title text-white"
//                     id={labelComponent?.options.id}
//                   >
//                     {label}
//                   </h3>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Statistics;