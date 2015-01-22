using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace VacifyWeb.Models
{
    public class VacationRequest
    {
        public string RequestBy { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; }
    }
}