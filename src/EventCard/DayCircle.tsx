import { FC } from "react";
import { format } from "date-fns";

type Props = {
  isShowing: boolean;
  start: string;
};

const DayCircle: FC<Props> = ({ isShowing, start }) => (
  <div className="absolute -left-[19px] w-[34px] flex items-center justify-center">
    <div
      className={`${
        isShowing ? "bg-emerald-500" : "bg-emerald-900"
      } text-white text-xs h-[26px] w-[26px] rounded-full flex items-center justify-center`}
    >
      {format(new Date(start), "d")}
    </div>
  </div>
);

export default DayCircle;
