export const STATUS_LABEL = { SUBMITTED: 'Submitted', IN_PROGRESS: 'In progress', RESOLVED: 'Resolved' };
const STEPS = ['SUBMITTED', 'IN_PROGRESS', 'RESOLVED'];

export function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{STATUS_LABEL[status]}</span>;
}

/** Three-step strip: Submitted -> In progress -> Resolved */
export function StatusTrack({ status }) {
  const current = STEPS.indexOf(status);
  return (
    <ol className="track" aria-label={`Status: ${STATUS_LABEL[status]}`}>
      {STEPS.map((s, i) => (
        <li key={s} className={i < current ? 'done' : i === current ? 'now' : ''}>
          {STATUS_LABEL[s]}
        </li>
      ))}
    </ol>
  );
}

export function RoomPlate({ id }) {
  return <span className="plate" title={`Complaint #${id}`}>#{id}</span>;
}
