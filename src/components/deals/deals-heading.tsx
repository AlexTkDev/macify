export function DealsHeading({ id = "handpicked-deals", headingId = "handpicked-deals-title" }: { id?: string; headingId?: string }) {
  return (
      <div className="deals-heading" id={id}>
        <h2 id={headingId}>
          <span>Handpicked deals.</span>
          <em>
            At a friendlier price.
            <svg aria-hidden="true" className="deals-heading-squiggle" focusable="false" preserveAspectRatio="none" viewBox="0 0 242 20">
              <path d="M1 10c8-8 16-8 24 0s16 6 24 0 16-7 24 0 16 8 24 0 16-6 24 0 16 7 24 0 16-8 24 0 16 6 24 0 16-7 24 0 16 8 24 0" vectorEffect="non-scaling-stroke" />
            </svg>
          </em>
        </h2>
      </div>
  );
}
