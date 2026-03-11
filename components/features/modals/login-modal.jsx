import React, { useEffect } from "react";
import { connect } from "react-redux";
import { useRouter } from "next/router";
import { logout } from "~/store/authReducer";

function LoginModal({ user, token, logout }) {
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    // <li>
    //   {token ? (
    //     <a onClick={handleLogout} >
    //       <i className="icon-user"></i> Logout
    //     </a>
    //   ) : (
    //     <a >
    //        <a href="/login" >
    //        <i className="icon-user"></i> Sign in / Sign up
    //     </a>
    //     </a>

    //   )}
    // </li>

    <li>
      {token ? (
        <a onClick={handleLogout}>
          <i className="icon" style={{ marginRight: "2px" }}>
            <svg
              stroke="currentColor"
              fill="currentColor"
              stroke-width="0"
              viewBox="0 0 24 24"
              height="15px"
              width="15px"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M16 13v-2H7V8l-5 4 5 4v-3z"></path>
              <path d="M20 3h-9c-1.103 0-2 .897-2 2v4h2V5h9v14h-9v-4H9v4c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2z"></path>
            </svg>
          </i>{" "}
          Logout
        </a>
      ) : (
        <a href="/login">
          <i className="icon-user"></i> Sign in / Sign up
        </a>
      )}
    </li>
  );
}

const mapStateToProps = (state) => ({
  token: state.auth.token,
});

export default connect(mapStateToProps, { logout })(LoginModal);
