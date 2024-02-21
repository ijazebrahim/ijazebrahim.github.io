import React from "react";
import { DateRangePicker } from "rsuite";
import "rsuite/dist/rsuite.min.css";

function MyDateRangePicker(props) {
  const { value, onChange, loading, onOpen } = props;
  const { before } = DateRangePicker;

  return (
    <div>
      <DateRangePicker
        shouldDisableDate={before(new Date(2020, 0, 1))}
        placeholder="Select Date"
        value={value}
        onChange={onChange}
        loading={loading}
        onOpen={onOpen}
      />
    </div>
  );
}

export default MyDateRangePicker;
