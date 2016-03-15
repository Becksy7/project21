<?php

    include "sys/config.php";

    if ( !function_exists('publicdir') ) {
        function publicdir($path) {
            global $build_dir;
            return str_replace("//", "/", "/${build_dir}/${path}" );
        }
    }

    if (!isset($page)) {
        $page = isset($_GET['page']) ? $_GET['page'] : 'index';
    }

    if ($page == 'index') {
        include "${src_dir}/views/layout-index.phtml";
    } else {
        include "${src_dir}/views/layout-page.phtml";
    }
