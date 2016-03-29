<?php
//
// Concating all .phtml files
// into static .html
//

include "config.php";

//
// Getting pages' names from /src/view/pages/PAGENAME.phtml
//
$pages = array_map(function($page){
    return basename($page, ".phtml");
}, array_diff(scandir("${src_dir}/views/pages"), array('..', '.')));


foreach($pages as $page) {

    ob_start();
    // there variable $page is read
    include "index.php";
    $content = ob_get_contents();
    ob_end_clean();

    // @bad_solution (no time for refactor yet)
    $content = str_replace("/${src_dir}/main.js", "/${build_dir}/js/main.js", $content);

    // clean abs-path from $content
    $content = str_replace("/${build_dir}/", '', $content);

    // replace links
    $content = preg_replace("/\/?\?page=([a-zA-Z0-9\-\_]+)/", "/${build_dir}/$1.html", $content);

    file_put_contents(sprintf("%s/%s.html", $build_dir, $page), $content);
}
