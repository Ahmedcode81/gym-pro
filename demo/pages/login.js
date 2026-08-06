/* ============================================================
   GymPro - Login Page
   ============================================================ */
function loadLogin(container) {
  const view = document.getElementById('login-view');
  view.innerHTML = GymProAuth.renderLogin();
  GymProAuth.initLogin();
}
