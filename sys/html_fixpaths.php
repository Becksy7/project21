<?php
//
// Fixing paths in built files
//

include "config.php";

//
// update paths in styles.css
//
$style = "${build_dir}/css/styles.css";

$style_content = file_get_contents( $style );
$style_content = str_replace("/${build_dir}/", '../', $style_content);
file_put_contents($style, $style_content);

//
// update paths in main.js
//
$script = "${build_dir}/js/main.js";

$script_content = file_get_contents( $script );
$script_content = str_replace("/${build_dir}/", '', $script_content);
file_put_contents($script, $script_content);
