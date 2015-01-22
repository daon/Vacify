using VacifyWeb.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace VacifyWeb.ViewModels
{
    public class VacationRequestViewModel
    {
        public string Name { get; set; }
        public string PictureUrl { get; set; }
        public string Manager { get; set; }
    }
}