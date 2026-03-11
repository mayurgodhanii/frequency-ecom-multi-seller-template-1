

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ALink from "~/components/features/alink";
import { apirequest } from "~/utils/api";
function MainMenu() {
  const router = useRouter();
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const response = await apirequest(
          "GET",
          `/user/setting-menu`,
          null,
          null
        );

        if (response && response.success) {

          const parsedData = JSON.parse(response.data);
          setMenuData(parsedData.menuItems || []);
        } else {
          throw new Error(response?.message || "Failed to fetch menu data");
        }
      } catch (error) {
        console.error("Error fetching menu data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  if (loading) {
    return <div></div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const renderSubMenu = (children) => {
    if (!children || children.length === 0) return null;

    return (
      <ul className="submenu">
        {children.map((child) => (
          <li key={child.id}>
            <ALink
              href={child.href}
              className={child.children?.length ? "sf-with-ul" : ""}
            >
              {child.name}
            </ALink>
            {renderSubMenu(child.children)}
          </li>
        ))}
      </ul>
    );
  };

  return (
     <div className="header-one">
    <nav className="main-nav">
      <ul className="menu sf-arrows">
        {menuData.map((menuItem) => (
          <li
            key={menuItem.id}
            className={router.asPath === menuItem.href ? "active" : ""}
          >
            <ALink
              href={menuItem.href}
              className={menuItem.children?.length ? "sf-with-ul" : ""}
            >
              {menuItem.name}
            </ALink>
            {renderSubMenu(menuItem.children)}
          </li>
        ))}
      </ul>
    </nav>
    </div>
  );
}

export default MainMenu;



// import { useState, useEffect } from "react";
// import { useRouter } from "next/router";
// import ALink from "~/components/features/alink";
// import { apirequest } from "~/utils/api";

// function MainMenu() {
//   const router = useRouter();
//   const [menuData, setMenuData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const { header, footer } = router.query;

//   useEffect(() => {
//     const fetchMenuData = async () => {
//       try {
//         const response = await apirequest(
//           "GET",
//           `/user/setting-menu`,
//           null,
//           null
//         );

//         if (response && response.success) {
//           const parsedData = JSON.parse(response.data);
//           setMenuData(parsedData.menuItems || []);
//         } else {
//           throw new Error(response?.message || "Failed to fetch menu data");
//         }
//       } catch (error) {
//         console.error("Error fetching menu data:", error);
//         setError(error.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMenuData();
//   }, []);

//   if (loading) return <div></div>;
//   if (error) return <div>Error: {error}</div>;

//   const buildUrlWithQuery = (href) => {
//     const url = new URL(href, "https://template6.frequency.co.in");
//     if (header) url.searchParams.set("header", header);
//     if (footer) url.searchParams.set("footer", footer);
//     return url.pathname + url.search;
//   };

//   const renderSubMenu = (children) => {
//     if (!children || children.length === 0) return null;

//     return (
//       <ul className="submenu">
//         {children.map((child) => (
//           <li key={child.id}>
//             <ALink
//               href={buildUrlWithQuery(child.href)}
//               className={child.children?.length ? "sf-with-ul" : ""}
//             >
//               {child.name}
//             </ALink>
//             {renderSubMenu(child.children)}
//           </li>
//         ))}
//       </ul>
//     );
//   };

//   return (
//     <div className="header-one">
//       <nav className="main-nav">
//         <ul className="menu sf-arrows">
//           {menuData.map((menuItem) => (
//             <li
//               key={menuItem.id}
//               className={router.asPath.startsWith(menuItem.href) ? "active" : ""}
//             >
//               <ALink
//                 href={buildUrlWithQuery(menuItem.href)}
//                 className={menuItem.children?.length ? "sf-with-ul" : ""}
//               >
//                 {menuItem.name}
//               </ALink>
//               {renderSubMenu(menuItem.children)}
//             </li>
//           ))}
//         </ul>
//       </nav>
//     </div>
//   );
// }

// export default MainMenu;

