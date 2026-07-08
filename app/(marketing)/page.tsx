import Link from "next/link";

export const metadata = {
  title: "Giantverse — Discover Your Name",
  description: "A brand experience. Discover the name that was always yours.",
};

export default function LandingPage() {
  return (
    <div className="container">
      <div className="head-bdr"></div>
      <div className="container-fluid">
        <table width="100%" cellPadding="0" cellSpacing="0" border={0}>
          <tbody>
            <tr>
              <td>
                <div className="content">
                  <div className="logo m-auto mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/Images/thegianthunt.png" alt="The Giant Hunt" title="The Giant Hunt" />
                  </div>
                  <div className="g-logo m-auto mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/Images/g-logo.png" alt="Giantverse" title="Giantverse" />
                  </div>
                  <div className="g-title2-cont mb-2">
                    <div className="line line1"></div>
                    <div className="g-title2">
                      <p className="f-12 txt-center txt-thm-clr-50-2 txt-upp">A brand experience</p>
                    </div>
                    <div className="line line2"></div>
                  </div>
                  <div className="g-title m-auto mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/Images/g-title.png" alt="Giantverse" title="Giantverse" />
                  </div>
                  <p className="mxw-385 m-auto txt-center f-14 fw-400 txt-thm-clr-70-2 line-ht-20">
                    Every person carries a name that was always theirs. Begin the ritual to discover yours.
                  </p>
                  <div className="txt-center mt-6 mb-3">
                    <Link href="/birth" className="btn">
                      Begin the Ritual
                    </Link>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="foot-bdr"></div>
    </div>
  );
}
