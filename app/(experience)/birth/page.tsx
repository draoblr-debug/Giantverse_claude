import { BirthRitualForm } from "@/components/experience/BirthRitualForm";

export default function BirthRitualPage() {
  return (
    <div className="legacy-container">
      <div className="head-bdr"></div>
      <div className="container-fluid">
        <table width="100%" cellPadding="0" cellSpacing="0" border={0}>
          <tbody>
            <tr>
              <td>
                <div className="content mxw-385 m-auto">
                  <div className="logo m-auto mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/Images/thegianthunt.png" alt="The Giant Hunt" title="The Giant Hunt" />
                  </div>
                  <div className="g-logo2 m-auto mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/Images/g-img1.png" alt="Giantverse" title="Giantverse" />
                  </div>
                  <div className="g-title2-cont mb-2">
                    <div className="line line1"></div>
                    <div className="g-title2">
                      <h1 className="h8 fw-600 txt-center">Birth Ritual</h1>
                    </div>
                    <div className="line line2"></div>
                  </div>
                  <BirthRitualForm />
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
