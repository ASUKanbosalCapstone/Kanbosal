$('.editable').summernote({
  minHeight: 200,
  placeholder: 'Enter description here.',
  toolbar: [
    // [groupName, [list of button]]
    ['style', ['bold', 'italic', 'underline', 'strikethrough', 'clear']],
    ['fontsize', ['fontsize']],
    ['color', ['color']],
    ['tools', ['link']],
    ['para', ['style', 'ul', 'ol', 'paragraph']]
  ]
});