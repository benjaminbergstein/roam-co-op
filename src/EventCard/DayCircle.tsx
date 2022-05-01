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
          } text-white text-xs h-[20px] w-[20px] rounded-full flex items-center justify-center animate-ping`}
        ></div>
      </div>
    )}

    <div className="absolute -left-[19px] w-[34px] flex items-center justify-center">
      <div
        className={`${
          isShowing ? config.bgHover : config.bg
        } text-white text-xs h-[26px] w-[26px] rounded-full flex items-center justify-center`}
      >
        {format(new Date(start), "d")}
      </div>
    </div>
  </>
);

export default DayCircle;
