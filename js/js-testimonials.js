$testimonials = $(".js-testimonials"), 
this.t_offset = 0
this.t_count = 0,

this.rotateTestimonial = function(n) {
    return function() {
        n.t_count++
        n.t_count === n.$testimonials.children().length ? (n.t_offset = 0, n.t_count = 0) : n.t_offset += 320
        n.$testimonials.css({
            // webkitTransform: "translateX(-" + n.t_offset + "px)",
            // MozTransform: "translateX(-" + n.t_offset + "px)",
            // transform: "translateX(-" + n.t_offset + "px)"
            'margin-left': "-" + n.t_offset + "px"
        })

        setTimeout(function(){
            // $('.testimonial').css({
            //     width : 320
            // })
        }, 200)

        // $('.testimonial').css({
        //     width : 321
        // })
        
        setTimeout(function() {
        	return n.rotateTestimonial()
        }, 4000)
    }
}(this)

this.rotateTestimonial()

