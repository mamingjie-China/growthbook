import Field from "@/components/Forms/Field";
import { hasFileConfig } from "@/services/env";
import BayesianPriorSettings from "@/components/Settings/BayesianPriorSettings";
import { StatsEngineSettingsForm } from "./StatsEngineSettings";

export default function BayesianTab({
  highlightColor,
  warningMsg,
  form,
}: {
  highlightColor: string;
  warningMsg: string;
  form: StatsEngineSettingsForm;
}) {
  return (
    <>
      <h4 className="mb-4 text-purple">贝叶斯设置</h4>

      <div className="form-group mb-2 mr-2 form-inline">
        <Field
          label="获胜概率阈值"
          type="number"
          step="任意"
          min="70"
          max="99"
          style={{
            width: "80px",
            borderColor: highlightColor,
            backgroundColor: highlightColor ? highlightColor + "15" : "",
          }}
          className={`ml-2`}
          containerClassName="mb-3"
          append="%"
          disabled={hasFileConfig()}
          helpText={
            <>
              <span className="ml-2">(默认值为95%)</span>
              <div
                className="ml-2"
                style={{
                  color: highlightColor,
                  flexBasis: "100%",
                }}
              >
                {warningMsg}
              </div>
            </>
          }
          {...form.register("confidenceLevel", {
            valueAsNumber: true,
            min: 50,
            max: 100,
          })}
        />
      </div>

      <BayesianPriorSettings />
    </>
  );
}
