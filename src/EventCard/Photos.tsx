import { addDays, format } from "date-fns";
import { FC, useState } from "react";
import useSWR from "swr";
import useCurrentUser from "../useCurrentUser";

type Props = {
  pageToken?: string;
  startDate: Date;
  endDate: Date;
};

type PhotosResponse = {
  mediaItems: any[];
  nextPageToken: string;
};

const Photos: FC<Props> = ({ pageToken = undefined, startDate, endDate }) => {
  const { api } = useCurrentUser();
  const [nextPageShowing, setNextPageShowing] = useState<boolean>(false);
  const queryParams = new URLSearchParams();
  queryParams.append("startDate", format(addDays(startDate, -1), "yyyy-MM-dd"));
  queryParams.append("endDate", format(addDays(endDate, 2), "yyyy-MM-dd"));
  if (pageToken) {
    queryParams.append("pageToken", pageToken);
  }
  const queryString = queryParams.toString();
  const { error, data: photosData } = useSWR<PhotosResponse>(
    ["photos", queryString].join(":"),
    async () => {
      if (!api) throw "error";
      const json = await api<any>(`/api/photos?${queryString}`, {});

      if (json.error) throw json.error;
      return json as PhotosResponse;
    }
  );
  const nextPageToken = photosData?.nextPageToken;

  if (!pageToken && photosData && !photosData.mediaItems)
    return (
      <div
        className="flex items-center bg-blue-100 text-sky-900 text-[0.7em] px-3 py-2 rounded mt-2"
        role="alert"
      >
        <p>
          {" "}
          No google photos found. This could be because they are pending back up
          from your devices.
        </p>
      </div>
    );
  return (
    <>
      {photosData?.mediaItems?.map((item: any) => (
        <img src={item.baseUrl} className="w-auto h-[200px] mx-2" />
      ))}
      {nextPageShowing && (
        <Photos
          pageToken={nextPageToken}
          startDate={startDate}
          endDate={endDate}
        />
      )}
      {nextPageToken && !nextPageShowing && (
        <button
          onClick={() => {
            setNextPageShowing(true);
          }}
          className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
        >
          Next page
        </button>
      )}
    </>
  );
};

export default Photos;
