import { getAccessToken } from "../../lib/utils";

const parseDate = (date: string) => {
  const [year, month, day] = date.split("-");
  return {
    year: parseInt(year),
    month: parseInt(month),
    day: parseInt(day),
  };
};

export const onRequest: API = async (context) => {
  try {
    const accessToken = await getAccessToken(context);
    const url = new URL(context.request.url);
    const pageToken = url.searchParams.get("pageToken");
    const startDate = url.searchParams.get("startDate") as string;
    const endDate = url.searchParams.get("endDate") as string;
    const data: any = {
      filters: {
        dateFilter: {
          ranges: [
            {
              startDate: parseDate(startDate),
              endDate: parseDate(endDate),
            },
          ],
        },
      },
    };
    if (pageToken) {
      data.pageToken = pageToken;
    }

    const body = JSON.stringify(data);
    const photosRes = await fetch(
      "https://photoslibrary.googleapis.com/v1/mediaItems:search",
      {
        method: "POST",
        body,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-type": "application/json",
        },
      }
    );
    const photosJSON = (await photosRes.json()) as object;

    return new Response(JSON.stringify(photosJSON));
  } catch (e) {
    if (e === "Unauthorized") {
      return new Response(JSON.stringify(null), { status: 401 });
    }
    throw e;
  }
};
