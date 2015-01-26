using System.Web;
using System.Web.Optimization;

namespace VacifyWeb
{
    public class BundleConfig
    {
        // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/libs").Include(
                    "~/Scripts/jquery-{version}.js",
                    "~/Scripts/angular.js",
                    "~/Scripts/angular-sanitize.js",
                    "~/Scripts/angular-animate.js",
                    "~/Scripts/angular-ui/ui-bootstrap.js",
                    "~/Scripts/angular-ui/ui-bootstrap-tpls.js",
                    "~/Scripts/moment.js",
                    "~/Scripts/fullcalendar.js",
                    "~/Scripts/calendar.js",
                    "~/Scripts/spcontext.js"
                ));

            bundles.Add(new ScriptBundle("~/bundles/app").Include(
                        "~/Scripts/app/vacify.module.js",
                        "~/Scripts/app/vacify.data.service.js",
                        "~/Scripts/app/vacify.calendar.controller.js",
                        "~/Scripts/app/vacify.navigation.controller.js",
                        "~/Scripts/app/vacify.moment.filter.js",
                        "~/Scripts/app/vacify.add.modal.js"));

            bundles.Add(new StyleBundle("~/Content/css").Include(
                      "~/Content/bootstrap.css",
                      "~/Content/fullcalendar.css",
                      "~/Content/bootstrap.custom.css"));
        }
    }
}
