<?php
/*
Template Name: My Custom Page for displaying map
*/

function my_scripts_method() {
  wp_deregister_script( 'spin' );
  wp_register_script(   'spin',    get_stylesheet_directory_uri() . '/javascript/spin.min.js', array(), NULL, true);
  wp_enqueue_script(    'spin' );
  wp_deregister_script( 'spinjquery' );
  wp_register_script(   'spinjquery',    get_stylesheet_directory_uri() . '/javascript/jquery.spin.js', array(), NULL, true);
  wp_enqueue_script(    'spinjquery' );
  wp_deregister_script( 'openlayers' );
  wp_register_script(   'openlayers',    '//openlayers.geokretymap.org/openlayers/OpenLayers.js', array(), NULL, true);
  wp_enqueue_script(    'openlayers' );
  wp_deregister_script( 'mapstraction' );
  wp_register_script(   'mapstraction',    '//mxn.geokretymap.org/mxn.js?(openlayers)', array(), NULL, true);
  wp_enqueue_script(    'mapstraction' );
  
  wp_deregister_script( 'map' );
  wp_register_script(   'map',    get_stylesheet_directory_uri() . '/javascript/map2.js');
  wp_enqueue_script(    'map' );

  #wp_deregister_style( 'openlayers' );
  #wp_register_style(   'openlayers',    get_stylesheet_directory_uri() . '/openlayers.css', array(), NULL, true);
  #wp_enqueue_style(    'openlayers' );
}    

add_action('wp_enqueue_scripts', 'my_scripts_method');


/**
 * The template for displaying all pages
 *
 * This is the template that displays all pages by default.
 * Please note that this is the WordPress construct of pages and that
 * other 'pages' on your WordPress site will use a different template.
 *
 * @package WordPress
 * @subpackage Twenty_Fourteen
 * @since Twenty Fourteen 1.0
 */

get_header(); ?>

<div id="main-content" class="main-content">

<?php
        if ( is_front_page() && twentyfourteen_has_featured_posts() ) {
                // Include the featured content template.
                get_template_part( 'featured-content' );
        }
?>
        <div id="primary" class="content-area">
                <div id="content" class="site-content" role="main">
                        <?php
                                // Start the Loop.
                                while ( have_posts() ) : the_post();

                                        // Include the page content template.
                                        get_template_part( 'content', 'page' );

                                        // If comments are open or we have at least one comment, load up the comment template.
                                        if ( comments_open() || get_comments_number() ) {
                                                comments_template();
                                        }
                                endwhile;
                        ?>
                </div><!-- #content -->
        </div><!-- #primary -->
        <?php get_sidebar( 'content' ); ?>
</div><!-- #main-content -->

<?php
get_sidebar();
get_footer();

?>
