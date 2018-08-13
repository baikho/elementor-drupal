var gulp = require('gulp');
var replace = require('gulp-replace');

var replaceArray = ["get_option",
"add_filter",
"add_action",
"have_posts",
"update_option",
"do_action",
"do_ajax",
"did_action",
"get_user_meta",
"get_current_user_id",
"query_posts",
"wp_register_script",
"wp_enqueue_media",
"wp_enqueue_script",
"wp_enqueue_style",
"wp_get_theme",
"sanitize_key",
"setup_postdata",
"wp_verify_nonce",
"wp_upload_dir",
"wp_mkdir_p",
"wp_get_current_user",
"wp_redirect",
"wp_send_json_success",
"wp_send_json_error",
"wp_doing_ajax",
"wp_parse_str",
"wp_parse_args",
"wp_remote_post",
"wp_remote_get",
"wp_remote_retrieve_body",
"wp_get_attachment_image",
"human_time_diff",
"wp_image_editor_supports",
"wp_embed_defaults",
"update_post_meta",
"delete_post_meta",
"wp_oembed_get",
"get_post_meta",
"get_edit_post_link",
"current_theme_supports",
"get_post_statuses",
"wp_is_post_revision",
"get_post_type_object",
"get_intermediate_image_sizes",
"is_rtl",
"wp_remote_retrieve_response_code",
"is_wp_error",
"admin_url",
"check_admin_referer",
"add_menu_page",
"add_submenu_page",
"register_activation_hook",
"add_post_type_support",
"get_bloginfo",
"register_taxonomy",
"register_post_type",
"register_uninstall_hook",
"_doing_it_wrong",
"add_query_arg",
"is_singular",
"get_the_ID",
"post_type_supports",
"get_post_type",
"delete_option",
"get_the_title",
"wp_get_attachment_image_src",
"set_transient",
"get_transient",
"remove_filter",
"remove_action",
"get_post",
"wp_is_post_autosave",
"wp_get_post_parent_id",
"apply_filters_ref_array",
"apply_filters_deprecated",
"apply_filters",
"shortcode_unautop",
"do_shortcode",
"wptexturize",
"wp_json_encode",
"absint",
"is_admin",
"__",
"_x",
"_n",
"esc_url",
"esc_html",
"esc_html__",
"esc_attr",
"esc_attr__",
"esc_attr_e",
"wp_list_pluck",
];


const regExp = new RegExp(`[\\[\\(\\.\\,\\s]?(${replaceArray.join("|")})(?=\\()`,"g");

gulp.task('replace', function() {
  gulp.src(['elementor/**/*.*', '!elementor/assets/**/*.*'])
    .pipe(replace(regExp, '$&_elementor_adapter'))
    .pipe(gulp.dest('elementor/'));

});

