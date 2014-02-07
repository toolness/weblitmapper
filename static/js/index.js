var gallery = new MakeGallery({
  tagPrefix: "weblit-",
  limit: 20
}, ".make-gallery", {
  apiURL: $('meta[name="makeapi-url"]').attr('content'),
  hidden: ['remix-button', 'thumbnail']
});
