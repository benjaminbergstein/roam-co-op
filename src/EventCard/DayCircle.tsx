import { FC } from "react";
import { format } from "date-fns";
import { ColorConfig, EventStateType } from "../types";

type Props = {
  isShowing: boolean;
  state: EventStateType;
  config: ColorConfig;
  start: string;
};

const DayCircle: FC<Props> = ({ state, isShowing, start, config }) => (
  <>
    {state === "ongoing" && (
      <div className="absolute -left-[19px] w-[34px] flex items-center justify-center">
        <div
          className={`${
            isShowing ? config.bgHover : config.bg
          } text-xs h-[26px] w-[26px] rounded-full flex items-center justify-center animate-pulse`}
        ></div>
      </div>
    )}

    <div className="absolute -left-[19px] w-[34px] flex items-center justify-center">
      <div
        className={`${isShowing ? config.bgHover : config.bg} 
 ${isShowing && state !== "past" ? "text-zinc-700" : "text-white"}
        text-xs ${
          state === "ongoing" ? "h-[22px] w-[22px]" : "h-[26px] w-[26px]"
        } font-semibold rounded-full flex items-center justify-center`}
      >
        {state !== "ongoing" && format(new Date(start), "d")}
      </div>
    </div>
  </>
);

export default DayCircle;
