var gallery = new MakeGallery({
  tagPrefix: "weblit-",
  limit: 20
}, ".make-gallery", {
  profileBaseURL: $('meta[name="webmaker-url"]').attr('content') + '/u/',
  tagBaseURL: $('meta[name="webmaker-url"]').attr('content') + '/t/',
  apiURL: $('meta[name="makeapi-url"]').attr('content'),
  hidden: ['remix-button', 'thumbnail']
});
