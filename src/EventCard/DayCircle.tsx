import { FC } from "react";
import { format } from "date-fns";
import { ColorConfig, EventStateType } from "../types";

type Props = {
  isHovered: boolean;
  state: EventStateType;
  config: ColorConfig;
  startDate: Date;
  isEvent: boolean;
  isBeforeOrAfter: boolean;
};

const DayCircle: FC<Props> = ({
  state,
  isBeforeOrAfter,
  startDate,
  config,
  isEvent,
}) => {
  const baseSize =
    state === "ongoing"
      ? isEvent
        ? "h-[28px] w-[28px]"
        : "h-[22px] w-[22px]"
      : isEvent
      ? "h-[34px] w-[34px]"
      : "h-[26px] w-[26px]";
  const bubbleSize = isEvent ? "h-[36px] w-[36px]" : "h-[26px] w-[26px]";

  return (
    <div
      className={`${
        isBeforeOrAfter || isEvent ? "mt-[15px]" : ""
      } flex items-center`}
    >
      {state === "ongoing" && (
        <div className="absolute -left-[19px] w-[34px] flex items-center justify-center">
          <div
            className={`${config.bg} text-xs ${bubbleSize} rounded-full flex items-center justify-center animate-pulse`}
          ></div>
        </div>
      )}

      <div className="absolute -left-[19px] w-[34px] flex items-center justify-center">
        <div
          className={`${config.bg} ${"text-white"}
        text-xs ${baseSize} font-semibold rounded-full flex items-center justify-center`}
        >
          {state !== "ongoing" && format(startDate, "d")}
        </div>
      </div>
    </div>
  );
};

export default DayCircle;
