import { useFeature } from "@growthbook/growthbook-react";
import { useEffect, useState } from "react";
import { BsQuestionLg, BsXLg } from "react-icons/bs";
import { FaArrowRight } from "react-icons/fa";
import { useUser } from "@/services/UserContext";
import { isCloud } from "@/services/env";
import { GBPremiumBadge } from "@/components/Icons";
import UpgradeModal from "@/components/Settings/UpgradeModal";

export default function InAppHelp() {
  const config = useFeature("pylon-config").value;
  const [showFreeHelpWidget, setShowFreeHelpWidget] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState(false);
  const { name, email, hasCommercialFeature, commercialFeatures } = useUser();
  const showUpgradeModal = !hasCommercialFeature("livechat") && isCloud();

  useEffect(() => {
    if (window["pylon"] || !config) return;

    if (hasCommercialFeature("livechat") && isCloud()) {
      const scriptElement = document.createElement("script");
      scriptElement.innerHTML = config.script_content;

      document.body.appendChild(scriptElement);
      window["pylon"] = {
        chat_settings: {
          app_id: config.app_id,
          email,
          name,
        },
      };
    }
  }, [config, commercialFeatures]);

  // 如果窗口上存在Pylon键，说明正在显示Pylon小部件，此时不应显示免费帮助模态框
  if (window["pylon"]) return null;

  return (
    <>
      {upgradeModal && (
        <UpgradeModal
          close={() => setUpgradeModal(false)}
          reason="为了获得实时聊天支持的访问权限，"
          source="in-app-help"
        />
      )}

      {showFreeHelpWidget && (
        <div
          className="bg-light shadow border rounded position-fixed"
          style={{
            right: "50px",
            bottom: "80px",
            maxWidth: "310px",
            zIndex: 10,
          }}
        >
          <div className="bg-purple rounded-top p-3 pb-4 d-flex align-items-center">
            <img
              alt="GrowthBook"
              src="/logo/growth-book-logomark-white.svg"
              className="mb-1 pr-1"
              style={{ height: 30 }}
            />
            <h2 className="text-white m-0">我们能提供什么帮助？</h2>
          </div>
          <div
            style={{
              position: "relative",
              top: "-30px",
              marginBottom: "-30px",
            }}
          >
            <div className="bg-white border rounded p-3 m-3 shadow">
              <p className="mb-2">
                <strong>有问题吗？</strong>
              </p>
              <a
                href="https://slack.growthbook.io/?ref=app-top-nav"
                target="blank"
                className="btn btn-primary font-weight-normal my-2 w-100"
              >
                加入Slack社区 <FaArrowRight className="ml-2" />
              </a>
              <a
                href="https://docs.growthbook.io/"
                target="blank"
                className="btn btn-outline-primary font-weight-normal my-2 w-100"
              >
                查看文档 <FaArrowRight className="ml-2" />
              </a>
            </div>
            {showUpgradeModal && (
              <div className="bg-white border rounded p-3 m-3 shadow">
                <p className="mb-2">
                  <strong>
                    升级您的账户以解锁实时聊天支持并访问高级功能。
                  </strong>
                </p>
                <button
                  className="btn btn-premium font-weight-normal my-2 w-100"
                  onClick={() => setUpgradeModal(true)}
                >
                  开始免费试用 <GBPremiumBadge />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* <button
        className="btn btn-primary d-flex align-items-center justify-content-center position-fixed rounded-circle"
        onClick={() => {
          setShowFreeHelpWidget(!showFreeHelpWidget);
        }}
        style={{
          right: "20px",
          bottom: "20px",
          zIndex: 10,
          height: "50px",
          width: "50px",
          fontSize: "30px",
        }}
      >
        {showFreeHelpWidget ? <BsXLg /> : <BsQuestionLg />}
      </button> */}
    </>
  );
}
