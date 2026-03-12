// import { useRouter } from "next/router";

// import ALink from "~/components/features/alink";

// function MainMenu() {
//   const router = useRouter();
//   let path = router.asPath;
//   let query = router.query;

//   function showAllDemos(e) {
//     let demoItems = document.querySelectorAll(".demo-item.hidden");

//     for (let i = 0; i < demoItems.length; i++) {
//       demoItems[i].classList.toggle("show");
//     }

//     document
//       .querySelector(".view-all-demos")
//       .classList.toggle("disabled-hidden");
//     e.preventDefault();
//   }

//   return (
//     <nav className="main-nav">
//       <ul className="menu sf-arrows">
//         <li
//           className={`megamenu-container ${path === "/" ? "active" : ""}`}
//           id="menu-home"
//         >
//           <ALink href="/">
//             Home
//           </ALink>
//         </li>


//         <li className={path.indexOf("pages/about") > -1 ? "active" : ""}>
//           <ALink href="/about">About</ALink>
//         </li>
//         <li className={path.indexOf("pages/contact") > -1 ? "active" : ""}>
//           <ALink href="/contact">Contact</ALink>
//         </li>
//    <li className={path.indexOf("/blog") > -1 ? 'active' : ''}><ALink href="/blog">Blog</ALink></li>

//       </ul>
//     </nav>
//   );
// }

// export default MainMenu;











// import { useState, useEffect } from "react";
// import { useRouter } from "next/router";
// import ALink from "~/components/features/alink";

// function MainMenu() {
//   const router = useRouter();
//   const [menuData, setMenuData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchMenuData = async () => {
//       try {
//         const response = await fetch(
//           `${process.env.NEXT_PUBLIC_API_URL}/user/setting-menu`
//         );
//         const data = await response.json();
//         if (data.success) {
//           setMenuData(data.data.menuItems || []);
//         }
//       } catch (error) {
//         console.error("Error fetching menu data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMenuData();
//   }, []);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   const renderSubMenu = (children) => {
//     if (!children || children.length === 0) return null;

//     return (
//       <ul>
//         {children.map((child) => (
//           <li key={child.id}>
//             <ALink href={child.href} className={child.children?.length ? "sf-with-ul" : ""}>
//               {child.name}
//             </ALink>
//             {renderSubMenu(child.children)}
//           </li>
//         ))}
//       </ul>
//     );
//   };

//   return (
//     <nav className="main-nav">
//       <ul className="menu sf-arrows">
//         {menuData.map((menuItem) => (
//           <li
//             key={menuItem.id}
//             className={router.asPath === menuItem.href ? "active" : ""}
//           >
//             <ALink
//               href={menuItem.href}
//               className={menuItem.children?.length ? "sf-with-ul" : ""}
//             >
//               {menuItem.name}
//             </ALink>
//             {renderSubMenu(menuItem.children)}
//           </li>
//         ))}
//       </ul>
//     </nav>
//   );
// }

// export default MainMenu;



import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ALink from "~/components/features/alink";
import { apirequest } from "~/utils/api";

function MainMenu() {
  const router = useRouter();
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);

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
        // setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);
  if (loading) {
    return <div></div>;
  }

  const renderSubMenu = (children) => {
    if (!children || children.length === 0) return null;

    return (

      <ul>
        {children.map((child) => (
          <li key={child.id}>
            <ALink href={child.href} className={child.children?.length ? "sf-with-ul" : ""}>
              {child.name}
            </ALink>
            {renderSubMenu(child.children)}
          </li>
        ))}
      </ul>

    );
  };

  return (
    <div className="header-second">
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
