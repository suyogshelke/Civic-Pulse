import { STATUS_LADDER, STATUS_META, STATUS } from '../../utils/constants';

/** Horizontal progress tracker across the six lifecycle stages (§9.4). */
export default function StatusStepper({ status }) {
  const rejected = status === STATUS.REJECTED;
  const currentStep = STATUS_META[status]?.step ?? 0;

  if (rejected) {
    return (
      <div className="alert alert-danger d-flex align-items-center gap-2 mb-0">
        <i className="bi bi-x-octagon-fill fs-5" />
        <div>This complaint was <strong>rejected</strong>. See the activity log below for the reason.</div>
      </div>
    );
  }

  return (
    <div className="stepper">
      {STATUS_LADDER.map((st) => {
        const meta = STATUS_META[st];
        const complete = meta.step < currentStep;
        const active = meta.step === currentStep;
        return (
          <div key={st} className={`step ${complete ? 'complete' : ''} ${active ? 'active' : ''}`}>
            <div className="dot">
              {complete ? <i className="bi bi-check-lg" /> : <i className={`bi ${meta.icon}`} />}
            </div>
            <div className="step-label">{meta.label}</div>
          </div>
        );
      })}
    </div>
  );
}
