import { PropagateLoader } from "react-spinners";

const color = "#0069ff";
const loading = true;
const override = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  width: "100vw",
};

export default function Loading() {
  return <PropagateLoader color={color}
        loading={loading}
        cssOverride={override}
        size={20}
        aria-label="Loading Spinner"
        data-testid="loader" />;
}