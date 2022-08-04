export default {};
if ((window as any).isMain) {
  import('./main');
} else {
  import('./present');
}
