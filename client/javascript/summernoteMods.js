$('.editable').summernote({
  minHeight: 150,
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