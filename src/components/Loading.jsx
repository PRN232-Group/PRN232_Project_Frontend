import "../styles/loading.css";

/**
 * Branded loading UI for Interior Studio.
 *
 * @param {boolean} fullscreen - cover the whole viewport (default true)
 * @param {string}  label      - caption text under the brand
 */
const Loading = ({ fullscreen = true, label = "Crafting your space" }) => {
  return (
    <div
      className={`loader ${fullscreen ? "loader--fullscreen" : "loader--inline"}`}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="loader-rings">
        <span className="loader-ring loader-ring--outer" />
        <span className="loader-ring loader-ring--mid" />
        <span className="loader-ring loader-ring--inner" />
        <span className="loader-monogram">IS</span>
      </div>

      <div className="loader-text">
        <span className="loader-brand">Interior Studio</span>
        <span className="loader-caption">
          {label}
          <span className="dots" aria-hidden="true">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </span>
      </div>

      <div className="loader-bar" aria-hidden="true" />
    </div>
  );
};

export default Loading;
