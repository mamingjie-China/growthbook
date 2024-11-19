import { FC } from "react";
import {
  ExperimentInterfaceStringDates,
  ExperimentPhaseStringDates,
} from "back-end/types/experiment";
import { useForm } from "react-hook-form";
import { validateAndFixCondition } from "shared/util";
import { getEqualWeights } from "shared/experiments";
import { useAuth } from "@/services/auth";
import { useWatching } from "@/services/WatchProvider";
import { useIncrementer } from "@/hooks/useIncrementer";
import Modal from "@/components/Modal";
import Field from "@/components/Forms/Field";
import FeatureVariationsInput from "@/components/Features/FeatureVariationsInput";
import ConditionInput from "@/components/Features/ConditionInput";
import NamespaceSelector from "@/components/Features/NamespaceSelector";
import SavedGroupTargetingField, {
  validateSavedGroupTargeting,
} from "@/components/Features/SavedGroupTargetingField";

const NewPhaseForm: FC<{
  experiment: ExperimentInterfaceStringDates;
  mutate: () => void;
  close: () => void;
  source?: string;
}> = ({ experiment, close, mutate, source }) => {
  const { refreshWatching } = useWatching();

  const firstPhase = !experiment.phases.length;

  const prevPhase: Partial<ExperimentPhaseStringDates> =
    experiment.phases[experiment.phases.length - 1] || {};

  const form = useForm<ExperimentPhaseStringDates>({
    defaultValues: {
      name: prevPhase.name || "Main",
      coverage: prevPhase.coverage || 1,
      variationWeights:
        prevPhase.variationWeights ||
        getEqualWeights(experiment.variations.length),
      reason: "",
      dateStarted: new Date().toISOString().substr(0, 16),
      condition: prevPhase.condition || "",
      savedGroups: prevPhase.savedGroups || [],
      seed: prevPhase.seed || "",
      namespace: {
        enabled: prevPhase.namespace?.enabled || false,
        name: prevPhase.namespace?.name || "",
        range: prevPhase.namespace?.range || [0, 0.5],
      },
    },
  });

  const { apiCall } = useAuth();

  const variationWeights = form.watch("variationWeights");

  // Make sure variation weights add up to 1 (allow for a little bit of rounding error)
  const totalWeights = variationWeights.reduce(
    (total: number, weight: number) => total + weight,
    0
  );
  const isValid = totalWeights > 0.99 && totalWeights < 1.01;

  const [conditionKey, forceConditionRender] = useIncrementer();

  const submit = form.handleSubmit(async (value) => {
    if (!isValid) throw new Error("版本权重总和必须为1");

    validateSavedGroupTargeting(value.savedGroups);

    validateAndFixCondition(value.condition, (condition) => {
      form.setValue("condition", condition);
      forceConditionRender();
    });

    await apiCall<{ status: number; message?: string }>(
      `/experiment/${experiment.id}/phase`,
      {
        method: "POST",
        body: JSON.stringify(value),
      }
    );
    mutate();
    refreshWatching();
  });

  const hasLinkedChanges =
    !!experiment.linkedFeatures?.length || experiment.hasVisualChangesets;

  return (
    <Modal
      trackingEventModalType="new-phase-form"
      trackingEventModalSource={source}
      header={firstPhase ? "开始实验" : "新建实验阶段"}
      close={close}
      open={true}
      submit={submit}
      cta={"开始"}
      closeCta="取消"
      size="lg"
    >
      {hasLinkedChanges && experiment.status !== "stopped" && (
        <div className="alert alert-warning">
          <strong>警告：</strong> 开启新阶段将立即影响所有关联的特性标志和可视化变更。
        </div>
      )}
      <div className="row">
        <Field
          label="名称"
          containerClassName="col-lg"
          required
          {...form.register("name")}
        />
      </div>
      {!firstPhase && (
        <Field
          label="开启新阶段的原因"
          textarea
          {...form.register("reason")}
          placeholder="(可选)"
        />
      )}
      {!hasLinkedChanges && (
        <Field
          label="开始时间（UTC）"
          type="datetime-local"
          {...form.register("dateStarted")}
        />
      )}

      {hasLinkedChanges && (
        <SavedGroupTargetingField
          value={form.watch("savedGroups") || []}
          setValue={(savedGroups) => form.setValue("savedGroups", savedGroups)}
          project={experiment.project || ""}
        />
      )}

      {hasLinkedChanges && (
        <ConditionInput
          defaultValue={form.watch("condition")}
          onChange={(condition) => form.setValue("condition", condition)}
          key={conditionKey}
          project={experiment.project || ""}
        />
      )}

      <FeatureVariationsInput
        valueType={"string"}
        coverage={form.watch("coverage")}
        setCoverage={(coverage) => form.setValue("coverage", coverage)}
        setWeight={(i, weight) =>
          form.setValue(`variationWeights.${i}`, weight)
        }
        valueAsId={true}
        variations={
          experiment.variations.map((v, i) => {
            return {
              value: v.key || i + "",
              name: v.name,
              weight: form.watch(`variationWeights.${i}`),
              id: v.id,
            };
          }) || []
        }
        showPreview={false}
        hideCoverage={!hasLinkedChanges}
      />
      {hasLinkedChanges && (
        <NamespaceSelector
          form={form}
          featureId={experiment.trackingKey}
          trackingKey={experiment.trackingKey}
        />
      )}
    </Modal>
  );
};

export default NewPhaseForm;
