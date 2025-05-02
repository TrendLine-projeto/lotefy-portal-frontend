import React, { Suspense } from "react";
import Loading from "./MatxLoading";

const Loadable = (Component) => (props) =>
  (
    <Suspense
      fallback={
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <Loading />
        </div>
      }
    >
      <Component {...props} />
    </Suspense>
  );

export default Loadable;
