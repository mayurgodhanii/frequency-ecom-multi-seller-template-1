
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
         <div className="header-five">
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