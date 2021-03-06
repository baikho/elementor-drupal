<?php
namespace Elementor\Core\DynamicTags;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Elementor tag.
 *
 * An abstract class to register new Elementor tag.
 *
 * @since 2.0.0
 * @abstract
 */
abstract class Tag extends Base_Tag {

	const WRAPPED_TAG = false;

	/**
	 * @since 2.0.0
	 * @access public
	 *
	 * @param array $options
	 *
	 * @return string
	 */
	public function get_content( array $options = [] ) {
		$settings = $this->get_settings();

		ob_start();

		$this->render();

		$value = ob_get_clean();

		if ( $value ) {
			// TODO: fix spaces in `before`/`after` if WRAPPED_TAG ( conflicted with .elementor-tag { display: inline-flex; } );
			if ( ! empty( $settings['before'] ) ) {
				$value = wp_kses_post( $settings['before'] ) . $value;
			}

			if ( ! empty( $settings['after'] ) ) {
				$value .= wp_kses_post( $settings['after'] );
			}

			if ( self::WRAPPED_TAG ) :
				$value = '<span id="elementor-tag-' . esc_attr_elementor_adapter( $this->get_id() ) . '" class="elementor-tag">' . $value . '</span>';
			endif;

		} elseif ( ! empty( $settings['fallback'] ) ) {
			$value = $settings['fallback'];
		}

		return $value;
	}

	/**
	 * @since 2.0.0
	 * @access public
	 */
	final public function get_content_type() {
		return 'ui';
	}

	public function get_editor_config() {
		$config = parent::get_editor_config();

		$config['wrapped_tag'] = $this::WRAPPED_TAG;

		return $config;
	}

	/**
	 * @since 2.0.0
	 * @access protected
	 */
	protected function register_advanced_section() {
		$this->start_controls_section(
			'advanced',
			[
				'label' => ___elementor_adapter( 'Advanced', 'elementor' ),
			]
		);

		$this->add_control(
			'before',
			[
				'label' => ___elementor_adapter( 'Before', 'elementor' ),
			]
		);

		$this->add_control(
			'after',
			[
				'label' => ___elementor_adapter( 'After', 'elementor' ),
			]
		);

		$this->add_control(
			'fallback',
			[
				'label' => ___elementor_adapter( 'Fallback', 'elementor' ),
			]
		);

		$this->end_controls_section();
	}
}
