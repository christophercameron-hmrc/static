require 'govuk_component_test_helper'

class ButtonTestCase < ComponentTestCase
  def component_name
    "button"
  end

  test "no error if no parameters passed in" do
    assert_nothing_raised do
      render_component({})
      assert_select ".pub-c-button"
    end
  end

  test "renders text correctly" do
    render_component(text: "Submit")
    assert_select ".pub-c-button", text: "Submit"
  end

  test "renders start now button" do
    render_component(text: "Start now", href: "#", start: true)
    assert_select ".pub-c-button", text: "Start now", href: "#"
    assert_select ".pub-c-button--start"
  end

  test "renders an anchor if href set" do
    render_component(text: "Start now", href: "#")
    assert_select "a.pub-c-button"
    assert_select "button.pub-c-button", false
  end

  test "renders a button if href not set" do
    render_component(text: "Start now")
    assert_select "button.pub-c-button"
    assert_select "a.pub-c-button", false
  end

  test "renders info text" do
    render_component(text: "Start now", info_text: "Information text")
    assert_select ".pub-c-button", text: "Start now"
    assert_select ".pub-c-button__info-text", text: "Information text"
  end
end
