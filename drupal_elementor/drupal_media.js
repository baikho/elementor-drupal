const ControlMediaItemView = {
	ui: function() {
		var ui = ControlMultipleBaseItemView.prototype.ui.apply( this, arguments );

		ui.controlMedia = '.elementor-control-media';
		ui.mediaImage = '.elementor-control-media-image';
		ui.frameOpeners = '.elementor-control-media-upload-button, .elementor-control-media-image';
		ui.deleteButton = '.elementor-control-media-delete';

		return ui;
	},

	events: function() {
		return _.extend( ControlMultipleBaseItemView.prototype.events.apply( this, arguments ), {
			'click @ui.frameOpeners': 'openFrame',
			'click @ui.deleteButton': 'deleteImage'
		} );
	},

	applySavedValue: function() {
		var url = this.getControlValue( 'url' );

		this.ui.mediaImage.css( 'background-image', url ? 'url(' + url + ')' : '' );

		this.ui.controlMedia.toggleClass( 'elementor-media-empty', ! url );
	},

	openFrame: function() {
		if ( ! this.frame ) {
			this.initFrame();
		}

		this.frame.open();
	},

	deleteImage: function() {
		this.setValue( {
			url: '',
			id: ''
		} );

		this.applySavedValue();
	},

	/**
	 * Create a media modal select frame, and store it so the instance can be reused when needed.
	 */
	initFrame: function() {
		// Set current doc id to attach uploaded images.
		wp.media.view.settings.post.id = elementor.config.document.id;
		this.frame = wp.media( {
			button: {
				text: elementor.translate( 'insert_media' )
			},
			states: [
				new wp.media.controller.Library( {
					title: elementor.translate( 'insert_media' ),
					library: wp.media.query( { type: 'image' } ),
					multiple: false,
					date: false
				} )
			]
		} );

		// When a file is selected, run a callback.
		this.frame.on( 'insert select', this.select.bind( this ) );
	},

	/**
	 * Callback handler for when an attachment is selected in the media modal.
	 * Gets the selected image information, and sets it within the control.
	 */
	select: function() {
		this.trigger( 'before:select' );

		// Get the attachment from the modal frame.
		var attachment = this.frame.state().get( 'selection' ).first().toJSON();

		if ( attachment.url ) {
			this.setValue( {
				url: attachment.url,
				id: attachment.id
			} );

			this.applySavedValue();
		}

		this.trigger( 'after:select' );
	},

	onBeforeDestroy: function() {
		this.$el.remove();
	}
};








Object.assign(elementor.modules.controls.Media, ControlMediaItemView);





const ControlMediaItemViewGallery = {
	ui: function() {
		var ui = ControlBaseDataView.prototype.ui.apply( this, arguments );

		ui.addImages = '.elementor-control-gallery-add';
		ui.clearGallery = '.elementor-control-gallery-clear';
		ui.galleryThumbnails = '.elementor-control-gallery-thumbnails';
		ui.status = '.elementor-control-gallery-status-title';

		return ui;
	},

	events: function() {
		return _.extend( ControlBaseDataView.prototype.events.apply( this, arguments ), {
			'click @ui.addImages': 'onAddImagesClick',
			'click @ui.clearGallery': 'onClearGalleryClick',
			'click @ui.galleryThumbnails': 'onGalleryThumbnailsClick'
		} );
	},

	onReady: function() {
		this.initRemoveDialog();
	},

	applySavedValue: function() {
		var images = this.getControlValue(),
			imagesCount = images.length,
			hasImages = !! imagesCount;

		this.$el
			.toggleClass( 'elementor-gallery-has-images', hasImages )
			.toggleClass( 'elementor-gallery-empty', ! hasImages );

		var $galleryThumbnails = this.ui.galleryThumbnails;

		$galleryThumbnails.empty();

		this.ui.status.text( elementor.translate( hasImages ? 'gallery_images_selected' : 'gallery_no_images_selected', [ imagesCount ] ) );

		if ( ! hasImages ) {
			return;
		}

		this.getControlValue().forEach( function( image ) {
			var $thumbnail = jQuery( '<div>', { 'class': 'elementor-control-gallery-thumbnail' } );

			$thumbnail.css( 'background-image', 'url(' + image.url + ')' );

			$galleryThumbnails.append( $thumbnail );
		} );
	},

	hasImages: function() {
		return !! this.getControlValue().length;
	},

	openFrame: function( action ) {
		this.initFrame( action );

		this.frame.open();
	},

	initFrame: function( action ) {
		var frameStates = {
			create: 'gallery',
			add: 'gallery-library',
			edit: 'gallery-edit'
		};

		var options = {
			frame:  'post',
			multiple: true,
			state: frameStates[ action ],
			button: {
				text: elementor.translate( 'insert_media' )
			}
		};

		if ( this.hasImages() ) {
			options.selection = this.fetchSelection();
		}

		this.frame = wp.media( options );

		// When a file is selected, run a callback.
		this.frame.on( {
			'update': this.select,
			'menu:render:default': this.menuRender,
			'content:render:browse': this.gallerySettings
		}, this );
	},

	menuRender: function( view ) {
		view.unset( 'insert' );
		view.unset( 'featured-image' );
	},

	gallerySettings: function( browser ) {
		browser.sidebar.on( 'ready', function() {
			browser.sidebar.unset( 'gallery' );
		} );
	},

	fetchSelection: function() {
		var attachments = wp.media.query( {
			orderby: 'post__in',
			order: 'ASC',
			type: 'image',
			perPage: -1,
			post__in: _.pluck( this.getControlValue(), 'id' )
		} );

		return new wp.media.model.Selection( attachments.models, {
			props: attachments.props.toJSON(),
			multiple: true
		} );
	},

	/**
	 * Callback handler for when an attachment is selected in the media modal.
	 * Gets the selected image information, and sets it within the control.
	 */
	select: function( selection ) {
		var images = [];

		selection.each( function( image ) {
			images.push( {
				id: image.get( 'id' ),
				url: image.get( 'url' )
			} );
		} );

		this.setValue( images );

		this.applySavedValue();
	},

	onBeforeDestroy: function() {
		if ( this.frame ) {
			this.frame.off();
		}

		this.$el.remove();
	},

	resetGallery: function() {
		this.setValue( '' );

		this.applySavedValue();
	},

	initRemoveDialog: function() {
		var removeDialog;

		this.getRemoveDialog = function() {
			if ( ! removeDialog ) {
				removeDialog = elementor.dialogsManager.createWidget( 'confirm', {
					message: elementor.translate( 'dialog_confirm_gallery_delete' ),
					headerMessage: elementor.translate( 'delete_gallery' ),
					strings: {
						confirm: elementor.translate( 'delete' ),
						cancel: elementor.translate( 'cancel' )
					},
					defaultOption: 'confirm',
					onConfirm: this.resetGallery.bind( this )
				} );
			}

			return removeDialog;
		};
	},

	onAddImagesClick: function() {
		this.openFrame( this.hasImages() ? 'add' : 'create' );
	},

	onClearGalleryClick: function() {
		this.getRemoveDialog().show();
	},

	onGalleryThumbnailsClick: function() {
		this.openFrame( 'edit' );
	}

}

Object.assign(elementor.modules.controls.Gallery, ControlMediaItemViewGallery);



elementor.hooks.addAction( 'panel/open_editor/widget/image', function( panel, model, view ) {
// 	if ( 'section' !== model.elType && 'column' !== model.elType ) {
// 		return;
// 	}
   var $element = panel.$el.find( '.elementor-control-media' );

   if ( $element.length ) {
   	$element.click( function() {
   	  alert( 'Some Message' );
   	} );
   }
} );