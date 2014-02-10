var gallery = new MakeGallery({
  tagPrefix: "weblit-",
  limit: 20
}, ".make-gallery", {
  profileBaseURL: $('meta[name="webmaker-url"]').attr('content') + '/u/',
  apiURL: $('meta[name="makeapi-url"]').attr('content'),
  hidden: ['remix-button', 'thumbnail']
});
