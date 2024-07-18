export default {
  routes: [
    {
      method: "POST",
      path: "/reel/like",
      handler: "reel.like",
    },
    {
      method: "POST",
      path: "/reel/dislike",
      handler: "reel.dislike",
    },
    {
      method: "POST",
      path: "/reel/check-status",
      handler: "reel.checkStatusLike",
    },
  ],
};
